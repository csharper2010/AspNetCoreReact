using System;
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

                var artikel = new Artikel("Adelholzener Mineralwasser");
                int initialArtikelID = artikel.ID;

                await repository.Save(artikel);

                int savedArtikelID = artikel.ID;

                var artikelBeforeSaveChanges = await repository.GetById(savedArtikelID);

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
            int flushedArtikelID;

            using (var context = new GetränkehandelContext())
            {
                var repository = new BaseRepository<Artikel, int>(context);

                var artikel = new Artikel("Adelholzener Mineralwasser Classic");
                await repository.Save(artikel);
                context.SaveChanges();
                flushedArtikelID = artikel.ID;
            }
            using (var context = new GetränkehandelContext())
            {
                var repository = new BaseRepository<Artikel, int>(context);
                var artikel = await repository.GetById(flushedArtikelID);
                artikel.BezeichnungKurz = "Adelh. Mineralw. Classic";
                context.SaveChanges();
            }
            using (var context = new GetränkehandelContext())
            {
                var repository = new BaseRepository<Artikel, int>(context);
                var artikel = await repository.GetById(flushedArtikelID);

                Assert.Equal("Adelh. Mineralw. Classic", artikel.BezeichnungKurz);
            }
        }
    }
}
