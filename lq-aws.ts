import { Tags, Stack, StackProps, App } from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as autoscaling from 'aws-cdk-lib/aws-autoscaling';
import * as rds from 'aws-cdk-lib/aws-rds';

export class LqAwsCdkStack extends Stack {
    constructor(scope: App, id: string, props?: StackProps) {
        super(scope, id, props);

        // Create the VPC and subnets
        const vpc = new ec2.Vpc(this, 'LQ-VPC', {
            maxAzs: 2,
            natGateways: 1,
            subnetConfiguration: [
                {
                    cidrMask: 24,
                    name: 'LQ-Public-Subnet',
                    subnetType: ec2.SubnetType.PUBLIC,
                },
                {
                    cidrMask: 24,
                    name: 'LQ-Private-Subnet',
                    subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
                }
            ]
        });

        // Bastion Host Setup
        const bastionSecurityGroup = new ec2.SecurityGroup(this, 'LQ-Bastion-SG', {
            vpc: vpc,
            description: 'Allow SSH access to EC2 instance',
            allowAllOutbound: true,
        });
        // You can obtain your public IP by running 'curl checkip.amazonaws.com' from your laptop.
        // Edit and uncomment line below to restrict bastion host access from specific public IPs.
        //bastionSecurityGroup.addIngressRule(ec2.Peer.ipv4('x.x.x.x/32'), ec2.Port.tcp(22), 'Access from my IP only');
        // Comment out the following line if previous line is uncommented.
        bastionSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'Allow SSH access from anywhere');
        new ec2.Instance(this, 'LQ-BastionHost', {
            instanceType: new ec2.InstanceType('t3.micro'),
            machineImage: ec2.MachineImage.latestAmazonLinux2(),
            //machineImage: ec2.MachineImage.fromImageId('ami-00000000000000'),
            vpc: vpc,
            securityGroup: bastionSecurityGroup,
            instanceName: 'LQ-BastionHost',
            userData: ec2.UserData.custom('#!/bin/bash\nhostnamectl set-hostname lq-bastion\n'),
            keyName: 'juanmbkey',
            vpcSubnets: {
                subnets: vpc.publicSubnets
            }
        });

        // ALB and ASG setup
        const lb = new elbv2.ApplicationLoadBalancer(this, 'LQ-ALB', {
            vpc: vpc,
            internetFacing: false,
            loadBalancerName: 'LQ-ALB'
        });

        const listener = lb.addListener('Listener', {
            port: 3000,
            protocol: elbv2.ApplicationProtocol.HTTP
        });

        lb.connections.allowFromAnyIpv4(ec2.Port.tcp(3000), 'Allow inbound on port 3000');
        
        const asg = new autoscaling.AutoScalingGroup(this, 'ASG', {
            vpc: vpc,
            instanceType: new ec2.InstanceType('t3.xlarge'),
            // machineImage: ec2.MachineImage.fromImageId('ami-0000000000000'),
            machineImage: ec2.MachineImage.latestAmazonLinux2(),
            minCapacity: 2,
            maxCapacity: 4,
            vpcSubnets: {
                subnets: vpc.privateSubnets
            },
            userData: ec2.UserData.custom(`
                INDEX=$(curl -s http://169.254.169.254/latest/meta-data/ami-launch-index)
                PADDED_INDEX=$(printf "%02d" $INDEX)
                hostnamectl set-hostname lq-app-$PADDED_INDEX
            `),
            keyName: 'juanmbkey',
        });
        Tags.of(asg).add('Name', 'LQ-App', { applyToLaunchedInstances: true });
        asg.connections.allowFrom(lb, ec2.Port.tcp(3000), 'Allow from ALB port 3000');
        asg.connections.allowFrom(bastionSecurityGroup, ec2.Port.tcp(22), 'Allow SSH from bastion host');

        listener.addTargets('Target', {
            port: 3000,
            protocol: elbv2.ApplicationProtocol.HTTP,
            targets: [asg]
        });

        // This will determine when a new instance is spun up, based on network requests per minute.
        // It is best to use this parameter instead of CPU or memory.
        // Default granularity is 5 min, which is sufficient for the use case.
        // You can check the instance performance in the CloudWatch AWS console.
        asg.scaleOnRequestCount('HighLoad', {
            targetRequestsPerMinute: 50000
        });

        const db = new rds.DatabaseInstance(this, 'LQ-RDS', {
            engine: rds.DatabaseInstanceEngine.mysql({
                version: rds.MysqlEngineVersion.VER_8_0_34
            }),
            credentials: rds.Credentials.fromGeneratedSecret('admin'),
            vpc: vpc,
            vpcSubnets: {
                subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS
            },
            instanceType: ec2.InstanceType.of(ec2.InstanceClass.T4G, ec2.InstanceSize.XLARGE),
            allocatedStorage: 100,
            storageType: rds.StorageType.GP2,
            multiAz: true,
            deletionProtection: false,
        });

        db.connections.allowFrom(asg, ec2.Port.tcp(3306), 'Allow connections from ASG instances');

    }
}

const app = new App();
new LqAwsCdkStack(app, 'LqAwsCdkStack');
