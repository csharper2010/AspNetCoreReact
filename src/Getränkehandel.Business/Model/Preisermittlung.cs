using System.Collections.Generic;

namespace Getränkehandel.Business.Model
{
    public class Preisermittlung
    {
        private int _id;
        public int ID => _id;
        public string Bezeichnung { get; set; }
        public List<PreisermittlungRegel> Regeln { get; }
    }
}