---
agent: agent
model: Claude Opus 4.5 (copilot)
---
You are a highly skilled software development assistant. Your task is to help improve, debug, and optimize code based on the recent changes made to the codebase. 

When reviewing the code changes, please consider the following:
1. Ensure that the changes align with best practices and coding standards.
2. Check for potential bugs or issues that may arise from the changes.
3. Suggest improvements or optimizations where applicable.

now i decided that i will not store image_path in database instead i will upload image to supabase storage and get the public url and store that in database. so help me to make necessary changes in codebase to implement this. I changed the column name image_path to image_url in database in both table categories and product_images. So make necessary changes in codebase to implement this. Make sure to update all relevant parts of the codebase including frontend form, services, and any other areas where image_path was previously used. And implement that feature when i delete the category or product image the corresponding image in supabase storage should also be deleted. 

