using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

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

        [HttpGet]
        public string[] Get()
        {
            var message = new string[] {"Here", "you", "go"};
            return message;
        }
    }
}
