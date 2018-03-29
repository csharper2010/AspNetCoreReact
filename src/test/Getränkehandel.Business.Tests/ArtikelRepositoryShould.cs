using System;
using System.Linq;
using Getränkehandel.Business.Model;
using Getränkehandel.Infrastructure.Data;
using Getränkehandel.Infrastructure.Repository;
using Xunit;

namespace Getränkehandel.Business.Tests
{
    public class ArtikelRepositoryShould
    {
        [Fact]
        public async void FindSavedAndFlushedArtikel()
        {
            using (var context = new GetränkehandelContext())
            using (var otherContext = new GetränkehandelContext())
            {
                var repository = new BaseRepository<Artikel, int>(context);

                var artikel = new EinfacherArtikel("Adelholzener Mineralwasser 0.7l");
                artikel.PfandID = 3;

                int initialArtikelID = artikel.ID;

                await repository.Save(artikel);

                int savedArtikelID = artikel.ID;

                var artikelBeforeSaveChanges = await repository.GetById(savedArtikelID);

                var gebinde = new Gebinde("Adelholzener Mineralwasser 12x0.7l");
                gebinde.Inhalt.Add(new GebindeInhalt(12, artikel));
                gebinde.PfandID = 5;

                await repository.Save(gebinde);

                context.SaveChanges();

                int flushedArtikelID = artikel.ID;

                var artikelFromSameContext = await repository.GetById(flushedArtikelID);
                var artikelFromOtherContext = await new BaseRepository<Artikel, int>(new GetränkehandelContext()).GetById(flushedArtikelID);
                Assert.Equal(0, initialArtikelID);
                Assert.True(savedArtikelID < 0);
                Assert.True(flushedArtikelID > 0);
                Assert.NotEqual(savedArtikelID, flushedArtikelID);
                Assert.Same(artikel, artikelBeforeSaveChanges);
                Assert.Same(artikel, artikelFromSameContext);
                Assert.NotSame(artikel, artikelFromOtherContext);
            }
        }

        [Fact]
        public async void TrackChanges()
        {
            int flushedArtikelID, flushedGebindeId;

            using (var context = new GetränkehandelContext())
            {
                var repository = new BaseRepository<Artikel, int>(context);

                var artikel = new EinfacherArtikel("Adelholzener Mineralwasser Classic");
                artikel.PfandID = 3;
                await repository.Save(artikel);

                var gebinde = new Gebinde("Adelholzener Mineralwasser Classic 12x0.7l");
                gebinde.Inhalt.Add(new GebindeInhalt(12, artikel));
                gebinde.PfandID = 5;

                await repository.Save(gebinde);

                context.SaveChanges();
                flushedArtikelID = artikel.ID;
                flushedGebindeId = gebinde.ID;
            }
            using (var context = new GetränkehandelContext())
            {
                var repository = new BaseRepository<Artikel, int>(context);
                var artikel = await repository.GetById(flushedArtikelID);
                artikel.BezeichnungKurz = "Adelh. Mineralw. Classic";
                var gebinde = await repository.GetById(flushedGebindeId);
                gebinde.BezeichnungKurz = "Adelh. Mineralw. Class. 12";
                context.SaveChanges();
            }
            using (var context = new GetränkehandelContext())
            {
                var repository = new BaseRepository<Artikel, int>(context);
                var artikel = await repository.GetById(flushedArtikelID);
                var gebinde = await repository.GetById(flushedGebindeId) as Gebinde;

                Assert.Equal("Adelh. Mineralw. Classic", artikel.BezeichnungKurz);
                Assert.Equal("Adelh. Mineralw. Class. 12", gebinde.BezeichnungKurz);
                Assert.NotNull(artikel.Pfand);
                Assert.NotNull(gebinde.Pfand);
                Assert.NotEmpty(gebinde.Inhalt);
                Assert.Equal(artikel, gebinde.Inhalt.First().Artikel);
            }
        }
    }
}
