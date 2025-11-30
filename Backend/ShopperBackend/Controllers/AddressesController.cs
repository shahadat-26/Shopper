using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShopperBackend.DTOs;
using ShopperBackend.Models;
using ShopperBackend.Repositories;

namespace ShopperBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AddressesController : ControllerBase
    {
        private readonly IAddressRepository _addressRepository;

        public AddressesController(IAddressRepository addressRepository)
        {
            _addressRepository = addressRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetMyAddresses()
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var addresses = await _addressRepository.GetUserAddressesAsync(userId);
                return Ok(addresses);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetAddress(int id)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var address = await _addressRepository.GetByIdAsync(id);

                if (address == null)
                {
                    return NotFound(new { message = "Address not found" });
                }

                if (address.UserId != userId)
                {
                    return Unauthorized(new { message = "Unauthorized to view this address" });
                }

                return Ok(address);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateAddress([FromBody] CreateAddressDto createDto)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

                if (createDto.IsDefault)
                {
                    await _addressRepository.SetDefaultAddressAsync(userId, 0);
                }

                var address = new Address
                {
                    UserId = userId,
                    AddressLine1 = createDto.AddressLine1,
                    AddressLine2 = createDto.AddressLine2,
                    City = createDto.City,
                    State = createDto.State,
                    Country = createDto.Country,
                    PostalCode = createDto.PostalCode,
                    IsDefault = createDto.IsDefault,
                    AddressType = createDto.AddressType
                };

                address.Id = await _addressRepository.CreateAsync(address);

                return Ok(new AddressDto
                {
                    Id = address.Id,
                    AddressLine1 = address.AddressLine1,
                    AddressLine2 = address.AddressLine2,
                    City = address.City,
                    State = address.State,
                    Country = address.Country,
                    PostalCode = address.PostalCode,
                    IsDefault = address.IsDefault,
                    AddressType = address.AddressType
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAddress(int id, [FromBody] UpdateAddressDto updateDto)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var address = await _addressRepository.GetByIdAsync(id);

                if (address == null)
                {
                    return NotFound(new { message = "Address not found" });
                }

                if (address.UserId != userId)
                {
                    return Unauthorized(new { message = "Unauthorized to update this address" });
                }

                if (updateDto.IsDefault)
                {
                    await _addressRepository.SetDefaultAddressAsync(userId, id);
                }

                address.AddressLine1 = updateDto.AddressLine1;
                address.AddressLine2 = updateDto.AddressLine2;
                address.City = updateDto.City;
                address.State = updateDto.State;
                address.Country = updateDto.Country;
                address.PostalCode = updateDto.PostalCode;
                address.IsDefault = updateDto.IsDefault;
                address.AddressType = updateDto.AddressType;

                await _addressRepository.UpdateAsync(address);

                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAddress(int id)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var address = await _addressRepository.GetByIdAsync(id);

                if (address == null)
                {
                    return NotFound(new { message = "Address not found" });
                }

                if (address.UserId != userId)
                {
                    return Unauthorized(new { message = "Unauthorized to delete this address" });
                }

                var result = await _addressRepository.DeleteAsync(id);
                return Ok(new { success = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}/set-default")]
        public async Task<IActionResult> SetDefaultAddress(int id)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var result = await _addressRepository.SetDefaultAddressAsync(userId, id);
                return Ok(new { success = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}