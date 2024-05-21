# QKD telemetry dashboard

## Description

This QKD telemetry dashboard provides real-time monitoring and analysis of the quantum key distribution network, displaying key metrics such as key generation rates, error rates, and quantum bit error rates (QBER). It includes historical data views for trend analysis, an alert system for anomaly detection, visual analytics through graphs and heatmaps, and a status overview of network components. Security monitoring tracks encryption integrity and potential intrusions, while user access management ensures sensitive data is protected. This dashboard ensures the QKD network's optimal performance, security, and reliability.

This is an AWS CDK (Cloud Development Kit) stack that sets up a secure and scalable infrastructure using various AWS services. It creates a VPC with public and private subnets, a bastion host for SSH access, an application load balancer (ALB), an auto-scaling group (ASG) for application instances, and an RDS database instance. This configuration provides a robust foundation for deploying web applications with high availability and security.

Key components of the architecture:

- **VPC**: Configured with public and private subnets, and a NAT gateway.
- **Bastion Host**: Provides SSH access to instances within the VPC.
- **Application Load Balancer (ALB)**: Distributes traffic to application instances.
- **Auto Scaling Group (ASG)**: Ensures that the required number of application instances are running.
- **RDS Database Instance**: A highly available, managed MySQL database.

## Installation

To install and deploy the `LqAwsCdkStack`, follow these steps:

1. **Clone the repository:**

    ```bash
    git clone https://gitlab.aws.dev/qcn/lbt/partner-deployments.git
    cd partner-deployments
    ```

2. **Install dependencies:**

    ```bash
    npm install
    ```

3. **Bootstrap your AWS environment:**

    ```bash
    cdk bootstrap
    ```

4. **Deploy the stack:**

    ```bash
    cdk deploy
    ```

    Ensure you have the necessary AWS credentials configured.

## Usage

Once deployed, the stack will create the following resources:

- **VPC**: A virtual private cloud with public and private subnets.
- **Bastion Host**: An EC2 instance configured as a bastion host for SSH access.
- **ALB**: An application load balancer that routes HTTP traffic to the application instances.
- **ASG**: An auto-scaling group that maintains the desired number of application instances.
- **RDS**: A managed MySQL database instance.

You can access the bastion host using its public IP and use it to SSH into other instances within the VPC. The application load balancer will distribute incoming traffic to the instances in the auto-scaling group.

## Support

If you encounter any issues or have questions, please open an issue in the [GitLab repository](https://gitlab.aws.dev/qcn/lbt/partner-deployments/issues). We will respond as promptly as possible.

## Roadmap

Future enhancements for the `LqAwsCdkStack` project include:

- Adding more security controls and monitoring capabilities.
- Integrating with other AWS services like Lambda and S3.
- Providing examples for deploying various types of applications within the VPC.

## Contributing

We welcome contributions to the `LqAwsCdkStack` project! If you have an idea or a fix, please:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes.
4. Commit your changes (`git commit -m 'Add some feature'`).
5. Push to the branch (`git push origin feature-branch`).
6. Open a merge request.

Please ensure your code follows our coding standards and includes appropriate tests.

## Authors and acknowledgment

- **Your Name** - *Initial work* - [Your GitLab Profile](https://gitlab.aws.dev/your-profile)

We also want to thank all the contributors who have helped in developing and maintaining this project.

## Project status

The `LqAwsCdkStack` project is currently in the initial deployment phase. We are actively working on adding new features and improving the existing ones. Stay tuned for updates!
