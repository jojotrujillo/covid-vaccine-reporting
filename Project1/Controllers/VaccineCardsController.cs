using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;
using Tesseract;
using System.Text;

namespace Project1.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class VaccineCardsController : ControllerBase
    {
        private readonly ILogger<VaccineCardsController> _logger;
        private RedisInterface obj = new RedisInterface();
        private IDatabase _db;
        private static readonly string[] fields = new[]
        {
            "Last Name", "First Name", "MI", "Date of birth", "Patient number (medical record or IIS record number", "1st Dose COVID-19", "2nd Dose COVID-19", "Date", "Healthcare Professional or Clinic Site"
        };

        public VaccineCardsController(ILogger<VaccineCardsController> logger)
        {
            _logger = logger;
            _db = obj.Connection.GetDatabase();
        }

        [HttpPost]
        public IActionResult Post([FromBody]JsonData request)
        {
            var card = new VaccineCards
            {
                TimeStamp = GetTimestamp(request.Id),
                Image = Convert.FromBase64String(request.Base64.Remove(0, 22))
            };

            using (var engine = new TesseractEngine(@"./tessdata", "eng", EngineMode.Default))
            {
                using (var img = Pix.LoadFromMemory(card.Image))
                {
                    using (var page = engine.Process(img))
                    {
                        var text = page.GetText();
                        card.ImageText = text.Split('\n', StringSplitOptions.RemoveEmptyEntries).Select(s => s.Trim()).Where(t => !string.IsNullOrWhiteSpace(t)).ToList();
                    }
                }
            }

            _db.StringSet("timestamp", card.TimeStamp);

            try
            {
                for (int i = 0; i < fields.Length; i++)
                {
                    _db.StringSet(fields[i] + card.TimeStamp, card.ImageText[i]);
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex.Message);
            }

            SaveToCsv(card.TimeStamp, card.ImageText);

            return Ok();
        }

        [HttpGet]
        public IEnumerable<string> Get()
        {
            var cardText = new List<string>();
            var stamp = _db.StringGet("timestamp");

            foreach (var field in fields)
            {
                cardText.Add(_db.StringGet(field + stamp));
            }

            return cardText;
        }

        private static string GetTimestamp(DateTime value)
        {
            return value.ToString("yyyyMMddHHmmssffff");
        }

        private static void SaveToCsv(string timestamp, List<string> text)
        {
            var filePath = timestamp + ".csv";
            var delimiter = ",";
            var length = text.Count;
            var sb = new StringBuilder();

            for (int i = 0; i < length; i++)
            {
                sb.AppendLine(string.Join(delimiter, text[i]));
            }

            System.IO.File.WriteAllText(filePath, sb.ToString());
        }
    }
}
