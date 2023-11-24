export async function getServerSideProps(context) {
	let ticketObject = {};
	try {
		const response = await db.getDocument(
			process.env.NEXT_PUBLIC_DB_ID,
			process.env.NEXT_PUBLIC_TICKETS_COLLECTION_ID,
			context.query.id
		);

		ticketObject = response;
	} catch (err) {
		ticketObject = {};
	}

	return {
		props: { ticketObject },
	};
}
