'use server';

import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

const FormInvoiceSchema = z.object({
    id: z.string(),
    customerId: z.string({
        invalid_type_error: 'Please select a customer.',
    }),
    amount: z.coerce
        .number()
        .gt(0, { message: 'Please enter an amount greater than $0.' }),
    status: z.enum(['pending', 'paid'], {
        invalid_type_error: 'Please select an invoice status.',
    }),
    date: z.string(),
});

const FormCustomerSchema = z.object({
    id: z.string(),
    firstname: z.string({
        invalid_type_error: 'Please select your First Name.',
    }),
    lastname: z.string({
        invalid_type_error: 'Please select your Last Name.',
    }),
    image_url: z.string({
        invalid_type_error: 'Please select a valid url.',
    })
});

const CreateInvoice = FormInvoiceSchema.omit({ id: true, date: true });
const CreateCustomer = FormCustomerSchema.omit({ id: true, date: true });
const UpdateInvoice = FormInvoiceSchema.omit({ id: true, date: true });

export type StateInvoice = {
    errors?: {
        customerId?: string[];
        amount?: string[];
        status?: string[];
    };
    message?: string | null;
};

export type StateCustomer = {
    errors?: {
        firstname?: string[];
        lastname?: string[];
        image_url?: string[];
    };
    message?: string | null;
};

export async function createInvoice(prevState: StateInvoice, formData: FormData) {
    // Validate form using Zod
    const validatedFields = CreateInvoice.safeParse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    // If form validation fails, return errors early. Otherwise, continue.
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create Invoice.',
        };
    }

    // Prepare data for insertion into the database
    const { customerId, amount, status } = validatedFields.data;
    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0];

    // Insert data into the database
    try {
        await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
    } catch (error) {
        // If a database error occurs, return a more specific error.
        return {
            message: 'Database Error: Failed to Create Invoice.',
        };
    }

    // Revalidate the cache for the invoices page and redirect the user.
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

export async function updateInvoice(
    id: string,
    prevState: StateInvoice,
    formData: FormData,
) {
    const validatedFields = UpdateInvoice.safeParse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Update Invoice.',
        };
    }

    const { customerId, amount, status } = validatedFields.data;
    const amountInCents = amount * 100;

    try {
        await sql`
      UPDATE invoices
      SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
      WHERE id = ${id}
    `;
    } catch (error) {
        return { message: 'Database Error: Failed to Update Invoice.' };
    }

    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

export async function createCustomer(prevState: StateCustomer, formData: FormData) {
    // Validate form using Zod
    const validatedFields = CreateCustomer.safeParse({
        firstname: formData.get('firstname'),
        lastname: formData.get('lastname'),
        image_url: formData.get('image_url')
    });

    // Affiche en console les données du formulaire
    console.log(formData.get('firstname'), formData.get('lastname'), formData.get('image_url'));
    console.log(validatedFields);

    // If form validation fails, return errors early. Otherwise, continue.
    if (!validatedFields.success || formData.get('firstname') === '' || formData.get('lastname') === '' || formData.get('image_url') === '') {
        return {
            message: 'Missing Fields. Failed to Create Customer.',
        };
    }

    let firstname, lastname, image_url;

    // Prepare data for insertion into the database
    if (validatedFields.success) {
        firstname = validatedFields.data.firstname;
        lastname = validatedFields.data.lastname;
        image_url = validatedFields.data.image_url;
    }

    const name = firstname + ' ' + lastname;
    const email = firstname.toLowerCase() + '.' + lastname.toLowerCase() + '@mail.com';

    // Insert data into the database
    // L'id s'incrémente automatiquement
    try {
        await sql`
        INSERT INTO customers (name, email, image_url)
        VALUES (${name}, ${email}, ${image_url})
    `;
    } catch (error) {
        console.log(error);
        return {
            message: 'Database Error: Failed to Create Customer.',
        };
    }

    // Revalidate the cache for the invoices page and redirect the user.
    revalidatePath('/dashboard/customers');
    redirect('/dashboard/customers');
}

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        await signIn('credentials', formData);
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials.';
                default:
                    return 'Something went wrong.';
            }
        }
        throw error;
    }
}

export async function deleteInvoice(id: string) {
    // throw new Error('Failed to Delete Invoice');
    try {
        await sql`DELETE FROM invoices WHERE id = ${id}`;
        revalidatePath('/dashboard/invoices');
        return { message: 'Deleted Invoice.' };
    } catch (error) {
        return { message: 'Database Error: Failed to Delete Invoice.' };
    }
}