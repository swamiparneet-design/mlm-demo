using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using MLM.Application.Placement;
using MLM.Application.Services.Auth;
using MLM.Application.Services.Stages;
using MLM.Application.Services.Users;
using MLM.Application.Services.Zones;
using MLM.Application.StageProgression;

namespace MLM.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddAutoMapper(typeof(DependencyInjection).Assembly);
        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);

        // Placement strategy pattern: every IPlacementStrategy implementation is
        // registered here and resolved at runtime by PlacementStrategyFactory
        // based on Zone.PlacementStrategyType. Add new strategies by registering
        // them here - no other code needs to change.
        services.AddScoped<IPlacementStrategy, SequentialPlacementStrategy>();
        services.AddScoped<IPlacementStrategyFactory, PlacementStrategyFactory>();
        services.AddScoped<IPlacementService, PlacementService>();

        services.AddScoped<IStageProgressionService, StageProgressionService>();

        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IZoneService, ZoneService>();
        services.AddScoped<IStageService, StageService>();
        services.AddScoped<IAdminUserService, AdminUserService>();
        services.AddScoped<IMyAccountService, MyAccountService>();

        return services;
    }
}
