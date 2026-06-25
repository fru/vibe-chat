using System.Collections.Concurrent;

namespace App.Services;

public class DeliveryTracker : IDeliveryTracker
{
    private readonly ConcurrentDictionary<int, TaskCompletionSource<bool>> _pending = new();

    public Task<bool> WaitForClientAckAsync(int messageId, TimeSpan timeout)
    {
        var tcs = new TaskCompletionSource<bool>(TaskCreationOptions.RunContinuationsAsynchronously);
        _pending[messageId] = tcs;

        var linkedCts = CancellationTokenSource.CreateLinkedTokenSource(new CancellationTokenSource(timeout).Token);
        linkedCts.Token.Register(() =>
        {
            if (tcs.TrySetResult(false))
            {
                _pending.TryRemove(messageId, out _);
            }
        });

        return tcs.Task;
    }

    public void Complete(int messageId)
    {
        if (_pending.TryRemove(messageId, out var tcs))
        {
            tcs.TrySetResult(true);
        }
    }
}
