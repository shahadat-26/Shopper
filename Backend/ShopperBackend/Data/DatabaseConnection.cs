using System;
using System.Data;
using Npgsql;
using Microsoft.Extensions.Configuration;

namespace ShopperBackend.Data
{
    public interface IDatabaseConnection
    {
        IDbConnection CreateConnection();
    }

    public class DatabaseConnection : IDatabaseConnection
    {
        private readonly IConfiguration _configuration;

        public DatabaseConnection(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public IDbConnection CreateConnection()
        {
            var connectionString = _configuration.GetConnectionString("DefaultConnection");
            return new NpgsqlConnection(connectionString);
        }
    }
}