interface ApiResponse {
  message: string;
  version: string;
  hostname: string;
  current_time: string;
}

async function fetchHelloData(): Promise<ApiResponse> {
  try {
    // NEXT_PUBLIC_API_URL環境変数を使用
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://backend:80';
    const apiUrl = `${baseUrl}/api/hello`;
    
    console.log(apiUrl);
    const response = await fetch(apiUrl, {
      cache: 'no-store', // 常に最新のデータを取得
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log(response);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch hello data:', error);
    throw error;
  }
}

export default async function HelloPage() {
  let data: ApiResponse | null = null;
  let error: string | null = null;

  try {
    data = await fetchHelloData();
    console.log(data);
  } catch (err) {
    error = err instanceof Error ? err.message : 'An error occurred';
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">エラーが発生しました</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">Hello Page</h1>
        
        {data && (
          <div className="p-8">
            <div className="space-y-2">
              <p><strong>メッセージ:</strong> {data.message}</p>
              <p><strong>Railsバージョン:</strong> {data.version}</p>
              <p><strong>ホスト名:</strong> {data.hostname}</p>
              <p><strong>現在時刻:</strong> {data.current_time}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 