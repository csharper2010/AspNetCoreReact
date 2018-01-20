using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Getränkehandel.Business.Repository;
using Getränkehandel.Infrastructure.Data;
using Getränkehandel.Infrastructure.Repository;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;

namespace Getränkehandel.Web
{
    public class Startup
    {
        // This method gets called by the runtime. Use this method to add services to the container.
        // For more information on how to configure your application, visit https://go.microsoft.com/fwlink/?LinkID=398940
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddDbContext<GetränkehandelContext>();

            services.AddScoped(typeof(IRepository<,>), typeof(BaseRepository<,>));

            services.AddMvcCore(options =>
                {
                    options.RequireHttpsPermanent = true; // this does not affect api requests
                    options.RespectBrowserAcceptHeader = true; // false by default
                    //options.OutputFormatters.RemoveType<HttpNoContentOutputFormatter>();

                    // // these two are here to show you where to include custom formatters
                    // options.OutputFormatters.Add(new CustomOutputFormatter());
                    // options.InputFormatters.Add(new CustomInputFormatter());
                })
                //.AddApiExplorer()
                //.AddAuthorization()
                .AddFormatterMappings()
                //.AddCacheTagHelper()
                //.AddDataAnnotations()
                //.AddCors()
                .AddJsonFormatters();
            //services.AddMvc(routes => routes.);
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseMvcWithDefaultRoute();
        }
    }
}
