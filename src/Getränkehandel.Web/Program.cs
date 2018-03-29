using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Getränkehandel.Web
{
    public class Program
    {
        public static void Main(string[] args)
        {
            CreateWebHostBuilder(args)
                .Build()
                .Run();
        }

        public static IWebHostBuilder CreateWebHostBuilder(string[] args) =>
            // var configuration = new ConfigurationBuilder()
            //     .AddCommandLine(args)
            //     .Build();

            // var hostUrl = configuration["hosturl"];
            // if (string.IsNullOrEmpty(hostUrl)) {
            //     hostUrl = "http://0.0.0.0:80";
            // }

            WebHost.CreateDefaultBuilder(args)
                // .UseUrls(hostUrl)
                .UseStartup<Startup>();
    }
}
