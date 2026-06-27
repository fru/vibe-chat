using App.Data;
using Microsoft.AspNetCore.Mvc;
using System.Runtime.InteropServices;

namespace App.Controllers;

[ApiController]
public class MetaController : ControllerBase
{
    // GET /api/version.json
    [HttpGet("/api/version.json")]
    public object Version() => new
    {
        version = Environment.GetEnvironmentVariable("APP_VERSION") ?? "dev",
        commitSha = Environment.GetEnvironmentVariable("APP_COMMIT_SHA") ?? "local",
        runtime = RuntimeInformation.FrameworkDescription
    };
}
