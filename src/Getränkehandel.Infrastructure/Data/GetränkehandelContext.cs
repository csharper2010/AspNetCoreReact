using System.Linq;
using Getränkehandel.Business.Model;
using Getränkehandel.Infrastructure.Data.Converters;
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
            modelBuilder.Entity<Abrechnungseintrag>().Property<string>("discriminator").HasMaxLength(1);
            var abrechnungseintragDiscriminator = modelBuilder.Entity<Abrechnungseintrag>().ToTable("BASE_Artikel").HasDiscriminator<string>("discriminator");
            abrechnungseintragDiscriminator.HasValue<EinfacherArtikel>("A");
            abrechnungseintragDiscriminator.HasValue<Gebinde>("G");
            abrechnungseintragDiscriminator.HasValue<Pfand>("P");
            modelBuilder.Entity<Artikel>().HasBaseType<Abrechnungseintrag>();
            modelBuilder.Entity<EinfacherArtikel>().HasBaseType<Artikel>();
            modelBuilder.Entity<Gebinde>().HasBaseType<Artikel>();
            modelBuilder.Entity<Pfand>().HasBaseType<Abrechnungseintrag>();
            modelBuilder.Entity<Pfand>().Property(p => p.Betrag);//.HasConversion(new BetragConverter());
            modelBuilder.Entity<Artikel>().Property(a => a.PfandID);
            modelBuilder.Entity<Artikel>().HasOne(a => a.Pfand);
            modelBuilder.Entity<Artikel>().HasMany<GebindeInhalt>().WithOne(i => i.Artikel).OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<Gebinde>().HasMany(g => g.Inhalt).WithOne(i => i.Parent).OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<Pfand>().SeedData(
                new[] {
                    new { Bezeichnung = "Einwegpfand", Betrag = 0.25m, ID = 1 },
                    new { Bezeichnung = "MW-Pfand Glas", Betrag = 0.08m, ID = 2 },
                    new { Bezeichnung = "MW-Pfand Glas Spezial", Betrag = 0.15m, ID = 3 },
                    new { Bezeichnung = "MW-Pfand PET", Betrag = 0.15m, ID = 4 },
                    new { Bezeichnung = "MW-Pfand Kiste", Betrag = 1.50m, ID = 5 },
                    new { Bezeichnung = "MW-Pfand ½ Kiste", Betrag = 0.75m, ID = 6 }
                }.Select(v => new { v.Bezeichnung, BezeichnungKurz = v.Bezeichnung, /*Betrag = new Betrag(*/v.Betrag/*)*/, v.ID, discriminator = "P", Aktiv = true })
                .ToArray()
            );

            modelBuilder.Entity<GebindeInhalt>().ToTable("BASE_GebindeInhalt");
            modelBuilder.Entity<GebindeInhalt>().Property(i => i.ID).HasField("_id");
            modelBuilder.Entity<GebindeInhalt>().Property(i => i.Menge).HasField("_menge");
            modelBuilder.Entity<GebindeInhalt>().Property(a => a.ParentID).HasField("_parentID");
            modelBuilder.Entity<GebindeInhalt>().HasOne(a => a.Parent);
            modelBuilder.Entity<GebindeInhalt>().Property(a => a.ArtikelID).HasField("_artikelID");
            modelBuilder.Entity<GebindeInhalt>().HasOne(a => a.Artikel);

            modelBuilder.Entity<Preisliste>().ToTable("PRICING_Preisliste");
            modelBuilder.Entity<Preisliste>().Property(a => a.ID).HasField("_id");

            modelBuilder.Entity<Artikelpreis>().ToTable("PRICING_Artikelpreis");
            modelBuilder.Entity<Artikelpreis>().Property(a => a.ID).HasField("_id");
            modelBuilder.Entity<Artikelpreis>().Property(a => a.PreislisteID).HasField("_preislisteID");
            modelBuilder.Entity<Artikelpreis>().HasOne(a => a.Preisliste);
            modelBuilder.Entity<Artikelpreis>().Property(a => a.ArtikelID).HasField("_artikelID");
            modelBuilder.Entity<Artikelpreis>().HasOne(a => a.Artikel);

            modelBuilder.Entity<Preisermittlung>().ToTable("PRICING_Preisermittlung");
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
            optionsBuilder.UseSqlServer("Data Source=.\\SQLEXPRESS; Initial Catalog=Getränkehandel; Integrated Security=SSPI");
        }
    }
}