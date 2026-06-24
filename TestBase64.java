import java.util.Base64;
public class TestBase64 {
    public static void main(String[] args) {
        String token = "eyJ1c2VybmFtZSI6IjI1MzA2Iiwicm9sZSI6IlNUVURFTlQiLCJleHAiOjE3MTkyMjM4NDkzfQ==";
        try {
            System.out.println(new String(Base64.getDecoder().decode(token)));
        } catch(Exception e) {
            e.printStackTrace();
        }
    }
}
