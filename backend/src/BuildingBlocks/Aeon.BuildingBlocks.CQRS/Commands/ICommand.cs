using MediatR;
namespace Aeon.BuildingBlocks.CQRS.Commands;

public interface ICommand: IRequest
{
}

public interface ICommand<out TResult>: IRequest<TResult>
{
}