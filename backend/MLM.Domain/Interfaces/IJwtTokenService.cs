using MLM.Domain.Entities;

namespace MLM.Domain.Interfaces;

public interface IJwtTokenService
{
    string GenerateToken(User user);
}
