interface HelloWorldProps {
  message?: string;
}

export default function HelloWorld({
  message = 'Hello World',
}: HelloWorldProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold text-blue-600">{message}</h1>
    </div>
  );
}
