import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Image } from 'lucide-react';

interface Analysis {
  id: string;
  userId: string;
  imageUrl: string;
  symptoms: string;
  result: string;
  confidence: number;
  date: string;
}

export default function History() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

    const allAnalyses = JSON.parse(localStorage.getItem('dermaSolAnalyses') || '[]');
    const userAnalyses = allAnalyses.filter((a: Analysis) => a.userId === user?.id);
    setAnalyses(userAnalyses.sort((a: Analysis, b: Analysis) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ));
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Analysis History</h1>
            <p className="text-muted-foreground">View your past skin condition analyses</p>
          </div>

          {analyses.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No analyses yet. Start by analyzing your first image.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {analyses.map((analysis) => (
                <Card key={analysis.id} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{analysis.result}</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {new Date(analysis.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </CardDescription>
                      </div>
                      <Badge variant={analysis.confidence > 80 ? 'default' : 'secondary'}>
                        {analysis.confidence}% confidence
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <div className="aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                          {analysis.imageUrl ? (
                            <img src={analysis.imageUrl} alt="Analysis" className="w-full h-full object-cover" />
                          ) : (
                            <Image className="h-12 w-12 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2 text-sm text-muted-foreground">Symptoms Described</h4>
                        <p className="text-sm text-foreground">{analysis.symptoms}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
