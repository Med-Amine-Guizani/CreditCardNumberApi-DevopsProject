<img width="801" height="502" alt="image" src="https://github.com/user-attachments/assets/de9923a8-e670-49d9-a9c5-387420266989" />



Project Title: Resilient Containerized Microservice with Observability Stack
Overview This project is a robust, production-grade DevOps implementation of a credit card validation microservice based on the Luhn Algorithm. The system is designed to demonstrate modern cloud-native principles, featuring high availability, self-healing orchestration, and real-time observability.

Key Features

Microservice API: A Node.js/Express API that validates card checksums and identifies issuers (Visa, Mastercard, Amex).

Containerization: Packaged as a lightweight, immutable Docker image for consistent deployment across environments.

Orchestration: Deployed on a Kubernetes (Kind) cluster with 2-replica redundancy and automatic self-healing (Liveness Probes) to ensure zero downtime.

Observability: Integrated Prometheus monitoring stack to track real-time metrics (RED method: Rate, Errors, Duration) and structured JSON logging via Winston for advanced debugging.

Networking: Custom NodePort configuration to bridge the isolated cluster network directly to the local host for seamless access.

Tech Stack: Node.js, Express, Docker, Kubernetes (Kind), Prometheus, Winston Logger.
