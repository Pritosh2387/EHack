# Deploying Water Shadow on AWS

This guide covers deploying the Water Shadow full-stack platform:
- **Backend**: FastAPI ML/analytics service containerized on **Amazon ECS Express Mode** (AWS Fargate + automated Application Load Balancer with HTTPS).
- **Frontend**: React + Vite single-page application hosted on **AWS Amplify Hosting**.

---

## Architecture Overview

```
[Browser] 
   │
   ├─► [AWS Amplify Hosting] ────► React + Vite SPA (Routes: /exports, /regions, etc.)
   │
   └─► [ECS Express Mode ALB] ───► Fargate Container (FastAPI, Port 8080)
                                    ├── Health Check: /health
                                    ├── Datasets: ml_service/data/*.csv
                                    └── CORS: Restricts to Amplify domain
```

---

## Step 1: Build and Push Backend Container to Amazon ECR

1. **Log in to Amazon ECR**:
   ```bash
   aws ecr get-login-password --region <YOUR_AWS_REGION> | docker login --username AWS --password-stdin <YOUR_ACCOUNT_ID>.dkr.ecr.<YOUR_AWS_REGION>.amazonaws.com
   ```

2. **Create ECR Repository** (if not already created):
   ```bash
   aws ecr create-repository --repository-name water-shadow-backend --region <YOUR_AWS_REGION>
   ```

3. **Build the Docker Image** from the repository root:
   ```bash
   docker build -t water-shadow-backend:latest .
   ```

4. **Tag and Push to ECR**:
   ```bash
   docker tag water-shadow-backend:latest <YOUR_ACCOUNT_ID>.dkr.ecr.<YOUR_AWS_REGION>.amazonaws.com/water-shadow-backend:latest
   docker push <YOUR_ACCOUNT_ID>.dkr.ecr.<YOUR_AWS_REGION>.amazonaws.com/water-shadow-backend:latest
   ```

---

## Step 2: Deploy Backend to Amazon ECS Express Mode

1. Navigate to **Amazon ECS** in the AWS Management Console.
2. Select your cluster (or default) and click **Create service** -> Select **Express mode**.
3. **Configure Service Details**:
   - **Service name**: `water-shadow-backend`
   - **Container image URI**: `<YOUR_ACCOUNT_ID>.dkr.ecr.<YOUR_AWS_REGION>.amazonaws.com/water-shadow-backend:latest`
   - **Container port**: `8080`
4. **Configure Health Check**:
   - **Health check path**: `/health`
   - **Protocol**: `HTTP`
   - **Port**: `8080`
5. **Environment Variables**:
   - Add variable `FRONTEND_ORIGINS` = `http://localhost:5173` *(temporary placeholder until Amplify URL is generated in Step 3)*.
   - Add variable `PORT` = `8080`.
6. **Deploy**:
   - Click **Create**. ECS Express Mode will automatically provision the Fargate task, configure the Application Load Balancer with HTTPS/TLS termination, and generate a public DNS endpoint.
7. **Verify Backend**:
   - Copy the public service URL (e.g., `https://<service-domain>.elb.amazonaws.com` or AWS assigned domain).
   - Test endpoints:
     ```bash
     curl https://<YOUR_ECS_SERVICE_URL>/health
     curl https://<YOUR_ECS_SERVICE_URL>/api/v1/data-status
     ```

---

## Step 3: Deploy Frontend to AWS Amplify Hosting

1. In the AWS Management Console, navigate to **AWS Amplify**.
2. Click **Deploy an app** -> select **GitHub** -> click **Next**.
3. Select your repository and the `main` branch.
4. **Monorepo Settings**:
   - When asked if connecting a monorepo, specify `frontend` as the app root.
5. **Configure Build Settings**:
   - Amplify will automatically detect the root `amplify.yml`.
   - Under **Advanced settings** -> **Environment variables**, set:
     - `AMPLIFY_MONOREPO_APP_ROOT` = `frontend`
     - `VITE_API_BASE_URL` = `https://<YOUR_ECS_SERVICE_URL>` *(Public backend URL from Step 2 without a trailing slash and without `/api/v1`)*.
6. Click **Save and deploy**. Amplify will run `npm ci` and `npm run build` from `frontend/`.
7. **Configure Single-Page Application (SPA) Rewrites**:
   - Go to **Hosting** > **Rewrites and redirects**.
   - Add / verify the SPA 200 rewrite rule:
     - **Source address**: `</^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json)$)([^.]+$)/>`
     - **Target address**: `/index.html`
     - **Type**: `200 (Rewrite)`
   - *This ensures direct navigation and page refresh on `/exports`, `/regions`, `/crop-shift`, `/optimization`, `/sensitivity`, `/explain`, `/receipts`, and `/methodology` works seamlessly.*
8. Copy your published Amplify URL (e.g., `https://main.d123456789.amplifyapp.com`).

---

## Step 4: Lock Down Backend CORS with the Final Amplify URL

1. Return to **Amazon ECS** -> click your `water-shadow-backend` service.
2. Under **Service configuration** or **Update service**, update the container environment variable:
   - **Key**: `FRONTEND_ORIGINS`
   - **Value**: `https://main.d123456789.amplifyapp.com` *(your exact Amplify public origin without a trailing slash; multiple origins can be comma-separated)*.
3. Apply the update. ECS Express Mode performs a rolling deployment.
4. Open your Amplify URL in your browser to verify full end-to-end functionality across all interactive tools, simulation endpoints, and decision receipts.
