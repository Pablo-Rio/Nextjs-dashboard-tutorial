import Image from "next/image";

export default function Page() {
    const image_url = "/credits/avatar.png";
    return (
        <>
            <p>Cet examen est l'œuvre de Paul Rivière !</p>
            <Image src={image_url} alt="avatar" width={200} height={200} />
        </>
    );
}