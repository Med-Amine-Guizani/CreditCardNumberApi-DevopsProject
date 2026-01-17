
    <div class="container">
        <header>
            <h1>Resilient Containerized Microservice with Observability Stack</h1>
        </header>

        <section>
            <h2>Project Overview</h2>
            <p>
                This project is a robust, production-grade DevOps implementation of a <strong>credit card validation microservice</strong> based on the Luhn Algorithm. The system is designed to demonstrate modern cloud-native principles, featuring high availability, self-healing orchestration, and real-time observability.
            </p>
            
            <div class="diagram-placeholder">
                

[Image of Kubernetes microservice architecture diagram]

                <br>
                <em>(System Architecture Visualization)</em>
            </div>
        </section>

        <section>
            <h2>Key Features</h2>
            <ul>
                <li>
                    <strong>Microservice API:</strong> A Node.js/Express API that validates card checksums and identifies issuers (Visa, Mastercard, Amex).
                </li>
                <li>
                    <strong>Containerization:</strong> Packaged as a lightweight, immutable Docker image for consistent deployment across environments.
                </li>
                <li>
                    <strong>Orchestration:</strong> Deployed on a <strong>Kubernetes (Kind)</strong> cluster with 2-replica redundancy and automatic self-healing (Liveness Probes) to ensure zero downtime.
                </li>
                <li>
                    <strong>Observability:</strong> Integrated <strong>Prometheus</strong> monitoring stack to track real-time metrics (RED method: Rate, Errors, Duration) and structured JSON logging via <strong>Winston</strong> for advanced debugging.
                </li>
                <li>
                    <strong>Networking:</strong> Custom <strong>NodePort</strong> configuration to bridge the isolated cluster network directly to the local host for seamless access.
                </li>
            </ul>
        </section>

        <section>
            <h2>Technical Stack</h2>
            <div class="tech-stack">
                Node.js &bull; Express &bull; Docker &bull; Kubernetes (Kind) &bull; Prometheus &bull; Winston Logger
            </div>
        </section>
        <img width="801" height="502" alt="image" src="https://github.com/user-attachments/assets/de9923a8-e670-49d9-a9c5-387420266989" />
    </div>

