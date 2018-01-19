using Getränkehandel.Business.Model;
using Microsoft.EntityFrameworkCore;

namespace Getränkehandel.Infrastructure.Data
{
    public class GetränkehandelContext : DbContext
    {
        public GetränkehandelContext() : base(new DbContextOptions<GetränkehandelContext>())
        {
        }

        public GetränkehandelContext(DbContextOptions<GetränkehandelContext> options) : base(options)
        {
        }

        public DbSet<Artikel> Artikel { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Abrechnungseintrag>().Property(a => a.ID).HasField("_id");
            var abrechnungseintragDiscriminator = modelBuilder.Entity<Abrechnungseintrag>().ToTable("BASE_Artikel").HasDiscriminator<string>("discriminator");
            abrechnungseintragDiscriminator.HasValue<Artikel>("A");
            abrechnungseintragDiscriminator.HasValue<Pfand>("P");
            modelBuilder.Entity<Artikel>().HasBaseType<Abrechnungseintrag>();
            modelBuilder.Entity<Pfand>().HasBaseType<Abrechnungseintrag>();

            modelBuilder.Entity<Preisliste>().ToTable("PRICING_Preisliste");
            modelBuilder.Entity<Preisliste>().Property(a => a.ID).HasField("_id");

            modelBuilder.Entity<Artikelpreis>().ToTable("PRICING_Artikelpreis");
            modelBuilder.Entity<Artikelpreis>().Property(a => a.ID).HasField("_id");
            modelBuilder.Entity<Artikelpreis>().Property(a => a.PreislisteID).HasField("_preislisteID");
            modelBuilder.Entity<Artikelpreis>().HasOne(a => a.Preisliste);
            modelBuilder.Entity<Artikelpreis>().Property(a => a.ArtikelID).HasField("_artikelID");
            modelBuilder.Entity<Artikelpreis>().HasOne(a => a.Artikel);

            modelBuilder.Entity<Preisermittlung>() .ToTable("PRICING_Preisermittlung");
            modelBuilder.Entity<Preisermittlung>().Property(a => a.ID).HasField("_id");
            modelBuilder.Entity<Preisermittlung>().HasMany(a => a.Regeln).WithOne(r => r.Preisermittlung);

            modelBuilder.Entity<PreisermittlungRegel>().ToTable("PRICING_PreisermittlungRegel");
            modelBuilder.Entity<PreisermittlungRegel>().Property(a => a.PreisermittlungID);
            modelBuilder.Entity<PreisermittlungRegel>().HasOne(a => a.Preisermittlung);
            modelBuilder.Entity<PreisermittlungRegel>().Property(a => a.Rang).HasField("_rang");
            modelBuilder.Entity<PreisermittlungRegel>().HasKey(a => new { a.PreisermittlungID, a.Rang });
            modelBuilder.Entity<PreisermittlungRegel>().Property(a => a.PreislisteID);
            modelBuilder.Entity<PreisermittlungRegel>().HasOne(a => a.Preisliste);

            modelBuilder.Entity<Lager>().ToTable("STOCK_Lager");
            modelBuilder.Entity<Lager>().Property(a => a.ID).HasField("_id");

            modelBuilder.Entity<LagerBestand>().ToTable("STOCK_LagerBestand");
            modelBuilder.Entity<LagerBestand>().Property(a => a.ID).HasField("_id");
            modelBuilder.Entity<LagerBestand>().Property(a => a.ArtikelID).HasField("_artikelID");
            modelBuilder.Entity<LagerBestand>().HasOne(a => a.Artikel);
            modelBuilder.Entity<LagerBestand>().Property(a => a.LagerID).HasField("_lagerID");
            modelBuilder.Entity<LagerBestand>().HasOne(a => a.Lager);
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseSqlServer("Data Source=.\\PTSQL; Initial Catalog=Getränkehandel; Integrated Security=SSPI");
        }
    }
}