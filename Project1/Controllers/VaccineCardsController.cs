using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Tesseract;

namespace Project1.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class VaccineCardsController : ControllerBase
    {
        private readonly ILogger<VaccineCardsController> _logger;

        public VaccineCardsController(ILogger<VaccineCardsController> logger)
        {
            _logger = logger;
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

            return Ok();
        }

        private static string GetTimestamp(DateTime value)
        {
            return value.ToString("yyyyMMddHHmmssffff");
        }
    }
}
