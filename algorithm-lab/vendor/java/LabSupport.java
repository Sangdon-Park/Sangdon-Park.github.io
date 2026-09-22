import java.lang.reflect.Array;

// Shared helpers and JSON transport. Student output is not used as judge data.
class LabSupport {
  static java.io.PrintStream[] quiet(){java.io.PrintStream[] original={System.out,System.err};java.io.PrintStream sink=new java.io.PrintStream(new java.io.OutputStream(){public void write(int b){} public void write(byte[] b,int off,int len){}});System.setOut(sink);System.setErr(sink);return original;}
  static String[] parts(String[] chunks){StringBuilder b=new StringBuilder();for(String s:chunks)b.append(s);return b.toString().split(",");}
  static int[] ints(String[] chunks){String[] s=parts(chunks);int[] a=new int[s.length];for(int i=0;i<s.length;i++)a[i]=Integer.parseInt(s[i]);return a;}
  static long[] longs(String[] chunks){String[] s=parts(chunks);long[] a=new long[s.length];for(int i=0;i<s.length;i++)a[i]=Long.parseLong(s[i]);return a;}
  static double[] doubles(String[] chunks){String[] s=parts(chunks);double[] a=new double[s.length];for(int i=0;i<s.length;i++)a[i]=Double.parseDouble(s[i]);return a;}
  static boolean[] booleans(String[] chunks){String[] s=parts(chunks);boolean[] a=new boolean[s.length];for(int i=0;i<s.length;i++)a[i]=Boolean.parseBoolean(s[i]);return a;}
  public static int lower_bound(int[] a,int x){int lo=0,hi=a.length;while(lo<hi){int m=(lo+hi)/2;if(a[m]<x)lo=m+1;else hi=m;}return lo;}
  public static int[] merge_arrays(int[] a,int[] b){int[] out=new int[a.length+b.length];int i=0,j=0,k=0;while(i<a.length&&j<b.length)out[k++]=a[i]<=b[j]?a[i++]:b[j++];while(i<a.length)out[k++]=a[i++];while(j<b.length)out[k++]=b[j++];return out;}
  public static int cross_sum(int[] a,int lo,int mid,int hi){int sum=0,left=a[mid-1],right=a[mid];for(int i=mid-1;i>=lo;i--){sum+=a[i];left=Math.max(left,sum);}sum=0;for(int i=mid;i<hi;i++){sum+=a[i];right=Math.max(right,sum);}return left+right;}
  public static int dsu_find(int[] parent,int x){if(parent[x]!=x)parent[x]=dsu_find(parent,parent[x]);return parent[x];}
  public static int pick_vertex(long[] dist,boolean[] used){int best=-1;for(int i=0;i<dist.length;i++)if(!used[i]&&dist[i]<1000000000000000000L&&(best==-1||dist[i]<dist[best]))best=i;return best;}
  static boolean same(Object a,Object b,double tolerance){
    if(a==null||b==null)return a==b;
    if(a.getClass().isArray()&&b.getClass().isArray()){
      if(Array.getLength(a)!=Array.getLength(b))return false;
      for(int i=0;i<Array.getLength(a);i++)if(!same(Array.get(a,i),Array.get(b,i),tolerance))return false;
      return true;
    }
    if(a instanceof Number&&b instanceof Number){
      if(a instanceof Float||a instanceof Double||b instanceof Float||b instanceof Double){double x=((Number)a).doubleValue(),y=((Number)b).doubleValue();return !Double.isNaN(x)&&!Double.isInfinite(x)&&Math.abs(x-y)<=tolerance;}
      return ((Number)a).longValue()==((Number)b).longValue();
    }
    return a.equals(b);
  }
  static String quote(String s){StringBuilder b=new StringBuilder("\"");for(int i=0;i<s.length();i++){char c=s.charAt(i);if(c=='"'||c=='\\')b.append('\\').append(c);else if(c<32)b.append(String.format("\\u%04x",(int)c));else b.append(c);}return b.append('"').toString();}
  static String json(Object x){
    if(x==null)return "null";
    if(x.getClass().isArray()){StringBuilder b=new StringBuilder("[");for(int i=0;i<Array.getLength(x);i++){if(i>0)b.append(',');b.append(json(Array.get(x,i)));}return b.append(']').toString();}
    if(x instanceof String||x instanceof Character)return quote(x.toString());
    return x.toString();
  }
  static String row(int n,boolean visible,boolean ok,String input,String message,Throwable error){
    String diagnostic="null";
    if(error!=null){int line=0;for(StackTraceElement frame:error.getStackTrace())if("Solution.java".equals(frame.getFileName())){line=frame.getLineNumber();break;}
      java.io.StringWriter trace=new java.io.StringWriter();error.printStackTrace(new java.io.PrintWriter(trace));
      diagnostic="{\"severity\":\"error\",\"file\":\"Solution.java\",\"line\":"+(line>0?line:"null")+",\"message\":"+quote(message)+",\"raw\":"+quote(trace.toString())+"}";}
    return "{\"number\":"+n+",\"public\":"+visible+",\"ok\":"+ok+",\"input\":"+quote(input)+",\"message\":"+quote(message)+",\"diagnostic\":"+diagnostic+"}";
  }
}
