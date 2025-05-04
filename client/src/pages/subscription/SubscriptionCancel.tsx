import { useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const SubscriptionCancel = () => {
  const navigate = useNavigate();

  return (
    <div className="container max-w-2xl py-12">
      <Card className="text-center">
        <CardHeader>
          <div className="mx-auto bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Subscription Canceled</CardTitle>
          <CardDescription>
            Your subscription process was canceled
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            You have canceled the subscription process. No charges have been made to your account.
          </p>
          
          <p className="text-muted-foreground">
            If you have any questions or encountered any issues during the subscription process, 
            please contact our support team.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Button variant="outline" onClick={() => navigate('/subscription/plans')}>
            View Plans Again
          </Button>
          <Button onClick={() => navigate('/marketplace')}>
            Browse Services
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SubscriptionCancel;
