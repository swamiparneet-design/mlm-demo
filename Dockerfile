# syntax=docker/dockerfile:1

############################
# Stage 1: Angular frontend build (Node 22)
############################
FROM node:22-alpine AS frontend-build
WORKDIR /frontend

# Repo ka package-lock.json thoda out-of-sync hai (@emnapi/wasi-threads version),
# isliye npm ci fail hone par npm install fallback use hota hai.
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --no-audit --no-fund || npm install --no-audit --no-fund

COPY frontend/ .
# Angular application builder outputs to dist/frontend/browser by default;
# flatten whatever layout it produces into /dist-out so the runtime copy is deterministic.
RUN npm run build -- --configuration=production \
    && mkdir -p /dist-out \
    && if [ -d "dist/frontend/browser" ]; then cp -r dist/frontend/browser/. /dist-out/; \
       else cp -r dist/. /dist-out/; fi

############################
# Stage 2: .NET backend publish (SDK 8)
############################
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS backend-build
WORKDIR /src

# Restore with only project files first so Docker layer caching works
COPY backend/MLM.API/MLM.API.csproj backend/MLM.API/
COPY backend/MLM.Application/MLM.Application.csproj backend/MLM.Application/
COPY backend/MLM.Domain/MLM.Domain.csproj backend/MLM.Domain/
COPY backend/MLM.Infrastructure/MLM.Infrastructure.csproj backend/MLM.Infrastructure/
RUN dotnet restore backend/MLM.API/MLM.API.csproj

COPY backend/ ./backend/
RUN dotnet publish backend/MLM.API/MLM.API.csproj -c Release -o /app/publish --no-restore

############################
# Stage 3: Final runtime image
############################
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

COPY --from=backend-build /app/publish .

# Replace any stale wwwroot from source with the fresh Angular build
RUN rm -rf /app/wwwroot && mkdir -p /app/wwwroot
COPY --from=frontend-build /dist-out/ /app/wwwroot/

ENV ASPNETCORE_ENVIRONMENT=Production \
    ASPNETCORE_URLS=http://+:8080

EXPOSE 8080

ENTRYPOINT ["dotnet", "MLM.API.dll"]
