using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Getränkehandel.Business.Model;
using Getränkehandel.Business.Repository;
using System.Linq.Expressions;
using Getränkehandel.Infrastructure.Data;

namespace Getränkehandel.Web.Controllers
{
    [Route("api/[controller]")]
    [ResponseCache(NoStore = true)]
    public class ArtikelController : Controller
    {
        private readonly IRepository<Artikel, int> repository;
        private readonly GetränkehandelContext dbContext;

        public ArtikelController(IRepository<Artikel, int> repository, GetränkehandelContext dbContext)
        {
            this.repository = repository;
            this.dbContext = dbContext;
        }

        // GET api/[controller]?suchbegriff=x
        [HttpGet]
        public async Task<IEnumerable<ArtikelResult>> Get([FromQuery]string suchbegriff = null)
        {
            Expression<Func<Artikel, bool>> pred = a => a.Aktiv;
            if (!string.IsNullOrWhiteSpace(suchbegriff))
            {
                bool isFirst = true;
                var suchbegriffe = suchbegriff.Split(' ', ',', '.', ';');
                foreach (var begriff in suchbegriffe)
                {
                    if (isFirst)
                    {
                        pred = pred.And(a => a.Bezeichnung.StartsWith(begriff));
                    }
                    else
                    {
                        pred = pred.And(a => a.Bezeichnung.Contains(begriff));
                    }
                    isFirst = false;
                }
            }
            return (await repository.Find(pred)).OrderBy(a => a.Bezeichnung).ThenBy(a => a.ID)
                .Select(a => new ArtikelResult(a));
        }

        // GET api/[controller]/5
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var artikel = await repository.GetById(id);
            return artikel != null
                ? (IActionResult)Ok(new ArtikelResult(artikel))
                : NotFound();
        }

        // DELETE api/[controller]/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var artikel = await repository.GetById(id);
            if (artikel != null)
            {
                repository.Delete(artikel);
                await dbContext.SaveChangesAsync();
                return Ok();
            }
            else
            {
                return NotFound();
            }
        }

        public class ArtikelResult
        {
            public ArtikelResult(Artikel artikel)
            {
                ID = artikel.ID;
                Bezeichnung = artikel.Bezeichnung;
                BezeichnungKurz = artikel.BezeichnungKurz;
                Aktiv = artikel.Aktiv;
                KurzCode = artikel.KurzCode;
            }
            public int ID { get; set; }
            public string Bezeichnung { get; set; }
            public string BezeichnungKurz { get; set; }
            public bool Aktiv { get; set; }
            public string KurzCode { get; set; }
        }
    }
}
