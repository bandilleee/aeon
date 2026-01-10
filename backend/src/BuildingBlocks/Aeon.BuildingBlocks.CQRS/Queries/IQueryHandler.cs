using MediatR;

namespace Aeon.BuildingBlocks.CQRS.Queries;

public interface IQueryHandler<in TQuery, TResult> : IRequestHandler<TQuery, TResult>
    where TQuery: IQuery<TResult>
{
}