<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Project Report: Luhn Validator</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f4f4f9;
            color: #333;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            display: flex;
            justify-content: center;
        }
        .container {
            background: white;
            width: 100%;
            max-width: 800px;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        header {
            border-bottom: 2px solid #007acc;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        h1 {
            color: #2c3e50;
            font-size: 28px;
            margin: 0;
        }
        h2 {
            color: #007acc;
            font-size: 20px;
            margin-top: 30px;
        }
        p {
            margin-bottom: 15px;
        }
        ul {
            list-style-type: none;
            padding: 0;
        }
        li {
            background: #eef7fc;
            margin: 10px 0;
            padding: 15px;
            border-left: 5px solid #007acc;
            border-radius: 4px;
        }
        .tech-stack {
            margin-top: 30px;
            padding: 15px;
            background-color: #2c3e50;
            color: white;
            border-radius: 4px;
            text-align: center;
            font-weight: bold;
        }
        .diagram-placeholder {
            text-align: center;
            margin: 20px 0;
            padding: 20px;
            border: 2px dashed #ccc;
            background-color: #fafafa;
            color: #666;
        }
    </style>
</head>
<body>

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

</body>
</html>
