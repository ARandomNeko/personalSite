export type PostMetadata = {
	title: string;
	date: string;
	tags?: string[];
	description?: string;
	published?: boolean;
	status?: 'read' | 'reading' | 'plan to read';
};

export type PostPreview = {
	metadata: PostMetadata;
	slug: string;
};
