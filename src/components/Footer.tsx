export default function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid #1f2937',
        padding: '32px 0',
        backgroundColor: '#030712',
        textAlign: 'center',
      }}
    >
      <p
        style={{
          fontSize: '12px',
          color: '#6b7280',
          margin: 0,
        }}
      >
        &copy; {new Date().getFullYear()} Krisna Music Course. Hak cipta dilindungi.
      </p>
    </footer>
  );
}