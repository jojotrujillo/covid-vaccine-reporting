using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Drawing;

namespace Project1
{
    public class VaccineCards
    {
        public string TimeStamp { get; set; }

        public byte[] Image { get; set; }

        public List<string> ImageText { get; set; }
    }

    public class JsonData
    {
        public DateTime Id { get; set; }

        public string Base64 { get; set; }
    }
}
