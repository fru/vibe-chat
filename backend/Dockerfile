# Stage 1: Compile application code
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy project definition and restore packages
COPY ["App.csproj", "./"]
RUN dotnet restore "App.csproj"

# Pull remaining C# files and publish compiled dlls
COPY . .
RUN dotnet publish "App.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Serve application using lightweight runtime
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# .NET default internal listening port is 8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "App.dll"]
