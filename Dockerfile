# syntax=docker/dockerfile:1
# Unsolved.Web — ASP.NET Core MVC (.NET 10). Build multi-estágio.

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
# restore em camada separada -> cache quando só o código muda
COPY src/Unsolved.Web/Unsolved.csproj src/Unsolved.Web/
RUN dotnet restore src/Unsolved.Web/Unsolved.csproj
COPY src/ src/
RUN dotnet publish src/Unsolved.Web/Unsolved.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
# Escuta em todas as interfaces na 8080. Se o PaaS injetar PORT, o Program.cs assume.
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
COPY --from=build /app/publish .
USER $APP_UID
ENTRYPOINT ["dotnet", "Unsolved.dll"]
