namespace App.Services;

public interface IDeliveryTracker
{
    Task<bool> WaitForClientAckAsync(int messageId, TimeSpan timeout);
    void Complete(int messageId);
}
