# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution file and restore dependencies
COPY backend/MLM.sln .
COPY backend/MLM.API/MLM.API.csproj MLM.API/
COPY backend/MLM.Application/MLM.Application.csproj MLM.Application/
COPY backend/MLM.Domain/MLM.Domain.csproj MLM.Domain/
COPY backend/MLM.Infrastructure/MLM.Infrastructure.csproj MLM.Infrastructure/

RUN dotnet restore MLM.API/MLM.API.csproj

# Copy everything else and build
COPY backend/ .
WORKDIR /src/MLM.API
RUN dotnet build MLM.API.csproj -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish MLM.API.csproj -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Install Node.js for Angular build
RUN apt-get update \
    && apt-get install -y nodejs npm \
    && rm -rf /var/lib/apt/lists/*

# Build Angular frontend
WORKDIR /frontend
COPY frontend ./
RUN npm ci \
    && npm run build -- --configuration=production \
    && cp -r dist/* /app/wwwroot/ || cp -r dist/mlm-frontend/* /app/wwwroot/ || true

# Copy published ASP.NET Core app
WORKDIR /app
COPY --from=publish /app/publish .

# Expose port
EXPOSE 8080

# Set environment
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

# Entry point
ENTRYPOINT ["dotnet", "MLM.API.dll"]