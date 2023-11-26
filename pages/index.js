import Head from "next/head";
import Image from "next/image";
import { GrAttachment } from "react-icons/gr";
import chat from "../images/chat.svg";
import AuthNav from "../components/AuthNav";
import { useRef, useState } from "react";
import { startMessage } from "../utils/functions";
import Processing from "../components/Processing";

export default function Home() {
	const [name, setName] = useState("");
	const fileName = useRef();
	const [email, setEmail] = useState("");
	const [subject, setSubject] = useState("");
	const [message, setMessage] = useState("");
	const [attachment, setAttachment] = useState(null);
	const [loading, setLoading] = useState(false);

	const handleSubmit = (e) => {
		e.preventDefault();
		setLoading(true);
		startMessage(name, email, subject, message, attachment, setLoading);
		setName("");
		setEmail("");
		setMessage("");
		setSubject("");
		setAttachment(null);
	};

	if (loading) return <Processing />;

	return (
		<>
			<Head>
				<title>FirmSupport</title>
				<meta name='description' content='Generated by create next app' />
				<meta name='viewport' content='width=device-width, initial-scale=1' />
				<link rel='icon' href='/favicon.ico' />
			</Head>
			<main className='w-full min-h-[100vh] '>
				<AuthNav />
				<div className='w-full min-h-[90vh] flex items-center'>
					<div className='md:w-[60%] w-full h-full flex flex-col py-6 md:px-10 px-4'>
						<h2 className='font-bold text-2xl mb-2'>Get in touch</h2>
						<p className='opacity-50 mb-6 text-sm'>
							Chat with us, we are available 24/7
						</p>
						<form className='flex flex-col items-start' onSubmit={handleSubmit}>
							<div className='w-full flex justify-between space-x-4'>
								<div className='w-1/2'>
									<label htmlFor='name'>Name</label>
									<input
										type='text'
										name='name'
										id='name'
										className='w-full border-[1px] border-gray-200 px-4 py-2 rounded mb-4'
										required
										value={name}
										onChange={(e) => setName(e.target.value)}
									/>
								</div>
								<div className='w-1/2'>
									<label htmlFor='email'>Email</label>
									<input
										type='email'
										name='email'
										id='email'
										value={email}
										required
										onChange={(e) => setEmail(e.target.value)}
										className='w-full border-[1px] border-gray-200 px-4 py-2 rounded mb-4'
									/>
								</div>
							</div>

							<label htmlFor='subject'>Subject</label>
							<input
								type='text'
								name='subject'
								id='subject'
								required
								value={subject}
								onChange={(e) => setSubject(e.target.value)}
								className='w-full border-[1px] border-gray-200 px-4 py-2 rounded mb-4'
							/>
							<label htmlFor='message'>Message</label>
							<textarea
								rows={5}
								id='message'
								required
								value={message}
								onChange={(e) => setMessage(e.target.value)}
								className='mb-4 border-[1px] border-gray-200 px-4 py-2 w-full'
							></textarea>

							<label
								htmlFor='file'
								className='cursor-pointer mb-6 border-[1px] p-3 rounded-lg flex items-center '
							>
								<GrAttachment className='mr-2' />
								{fileName.current?.files[0]?.name
									? fileName.current?.files[0]?.name
									: "Attach a screenshot"}
								<input
									type='file'
									name='file'
									ref={fileName}
									id='file'
									onChange={(e) => setAttachment(e.target.files[0])}
									className='hidden'
									accept='image/png, image/jpeg'
								/>
								<span></span>
							</label>

							<button className='p-3 bg-[#314484] rounded text-[#F4F8FB] w-[200px] hover:bg-[#2267D3]'>
								Send message
							</button>
						</form>
					</div>
					<div className='md:w-[40%] min-h-[90vh] bg-[#F4F8FB] md:flex hidden items-center justify-center py-6 px-8'>
						<Image src={chat} alt='Chat with us' />
					</div>
				</div>
			</main>
		</>
	);
}