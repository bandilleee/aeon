using MediatR;

namespace Aeon.BuildingBlocks.CQRS.Queries;

public interface IQuery<out TResult>: IRequest<TResult>
{
}