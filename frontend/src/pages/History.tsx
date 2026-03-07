import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Image } from 'lucide-react';

type ConsultationHistoryItem = {
  id: string;
  created_at: string;

  context_type?: 'medical' | 'skincare' | null;
  cv_label?: string | null;
  disease_confidence?: number | null; // usually 0..1
  skin_type?: string | null;
  image_url?: string | null;
};

export default function History() {
  const { isAuthenticated, session } = useAuth(); 
  const navigate = useNavigate();
  const [items, setItems] = useState<ConsultationHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

    const run = async () => {
      try {
        setLoading(true);

        const token = session?.access_token;
        if (!token) {
          navigate('/auth');
          return;
        }

        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/consultations/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401) {
          navigate('/auth');
          return;
        }

        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || `HTTP ${res.status}`);
        }

        const data: ConsultationHistoryItem[] = await res.json();
        console.log("history first item:", data?.[0]);
        // Backend already sorts by created_at desc in your router, but safe to re-sort:
        data.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        setItems(data);
      } catch (err) {
        console.error('History fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [isAuthenticated, session, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Analysis History</h1>
            <p className="text-muted-foreground">View your past skin condition analyses</p>
          </div>

          {loading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Loading...</p>
              </CardContent>
            </Card>
          ) : items.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No analyses yet. Start by analyzing your first image.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {items.map((x) => {
                const confidencePct =
                  x.disease_confidence == null ? null : Math.round(x.disease_confidence * 100);

                const title =
                  x.context_type === 'medical'
                    ? (x.cv_label ?? 'Medical case')
                    : 'Skincare guidance';

                return (
                  <Card
                    key={x.id}
                    className="overflow-hidden cursor-pointer"
                    onClick={() => navigate(`/history/${x.id}`)} // ✅ optional detail route
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2">{title}</CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {new Date(x.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </CardDescription>
                        </div>

                        {confidencePct != null && (
                          <Badge variant={confidencePct >= 80 ? 'default' : 'secondary'}>
                            {confidencePct}% confidence
                          </Badge>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <div className="aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center">
  {x.image_url ? (
    <img
      src={x.image_url}
      alt="Consultation"
      className="w-full h-full object-cover"
      loading="lazy"
      onError={(e) => {
        // fallback if signed url expired or blocked
        (e.currentTarget as HTMLImageElement).style.display = 'none';
      }}
    />
  ) : (
    <Image className="h-12 w-12 text-muted-foreground" />
  )}
</div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2 text-sm text-muted-foreground">Skin Type</h4>
                          <p className="text-sm text-foreground">{x.skin_type ?? '—'}</p>

                          <h4 className="font-semibold mt-4 mb-2 text-sm text-muted-foreground">Case Type</h4>
                          <p className="text-sm text-foreground">{x.context_type ?? '—'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}