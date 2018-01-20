using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Getränkehandel.Business.Model;
using Getränkehandel.Business.Repository;

namespace Getränkehandel.Web.Controllers
{
    [Route("api/[controller]")]
    [ResponseCache(NoStore = true)]
    public class ArtikelController : Controller
    {
        private readonly IRepository<Artikel, int> repository;

        public ArtikelController(IRepository<Artikel, int> repository)
        {
            this.repository = repository;
        }

        // GET api/artikel/5
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var artikel = await repository.GetById(id);
            return artikel != null
                ? (IActionResult)Ok(artikel)
                : NotFound();
        }
    }
}
