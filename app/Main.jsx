const { Content, Footer } = Layout;
import { Layout } from 'antd';
export default function Main() {
    return (
        <Layout>
            <Content
                style={{
                    background: '#ffffff'
                }}
            ></Content>
            <Footer
                style={{
                    textAlign: 'center',
                    background: '#ffffff'
                }}
            ></Footer>
        </Layout>
    );
}
