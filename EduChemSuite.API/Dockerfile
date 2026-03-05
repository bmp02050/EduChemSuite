FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY EduChemSuite.API/EduChemSuite.API/EduChemSuite.API.csproj ./EduChemSuite.API/
RUN dotnet restore EduChemSuite.API/EduChemSuite.API.csproj

COPY EduChemSuite.API/EduChemSuite.API/ ./EduChemSuite.API/
RUN dotnet publish EduChemSuite.API/EduChemSuite.API.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:9.0-alpine
RUN apk update && apk upgrade --no-cache
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "EduChemSuite.API.dll"]
