using AutoMapper;
using MLM.Application.DTOs.Payouts;
using MLM.Application.DTOs.Stages;
using MLM.Application.DTOs.Users;
using MLM.Application.DTOs.Zones;
using MLM.Domain.Entities;

namespace MLM.Application.Mapping;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<Zone, ZoneDto>()
            .ForMember(d => d.PlacementStrategyType, opt => opt.MapFrom(s => s.PlacementStrategyType.ToString()));

        CreateMap<Stage, StageDto>();

        CreateMap<User, UserDto>()
            .ForMember(d => d.Role, opt => opt.MapFrom(s => s.Role.ToString()))
            .ForMember(d => d.KycStatus, opt => opt.MapFrom(s => s.KycStatus.ToString()));

        CreateMap<PayoutTransaction, PayoutTransactionDto>()
            .ForMember(d => d.UserFullName, opt => opt.MapFrom(s => s.User.FullName))
            .ForMember(d => d.ZoneName, opt => opt.MapFrom(s => s.Zone.ZoneName))
            .ForMember(d => d.StageName, opt => opt.MapFrom(s => s.Stage.StageName))
            .ForMember(d => d.Status, opt => opt.MapFrom(s => s.Status.ToString()));

        CreateMap<UserZoneProgress, UserZoneProgressDto>()
            .ForMember(d => d.ZoneId, opt => opt.MapFrom(s => s.CurrentZoneId))
            .ForMember(d => d.ZoneName, opt => opt.MapFrom(s => s.CurrentZone.ZoneName))
            .ForMember(d => d.StageId, opt => opt.MapFrom(s => s.CurrentStageId))
            .ForMember(d => d.StageName, opt => opt.MapFrom(s => s.CurrentStage.StageName))
            .ForMember(d => d.RequiredPlacementCount, opt => opt.MapFrom(s => s.CurrentStage.RequiredPlacementCount))
            .ForMember(d => d.RequiredReferralCount, opt => opt.MapFrom(s => s.CurrentStage.RequiredReferralCount))
            .ForMember(d => d.PayoutAmount, opt => opt.MapFrom(s => s.CurrentStage.PayoutAmount))
            .ForMember(d => d.RetentionPercentage, opt => opt.MapFrom(s => s.CurrentStage.RetentionPercentage))
            .ForMember(d => d.ItemReward, opt => opt.MapFrom(s => s.CurrentStage.ItemReward))
            .ForMember(d => d.Status, opt => opt.MapFrom(s => s.Status.ToString()));
    }
}
