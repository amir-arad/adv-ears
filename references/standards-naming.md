Guidelines for names (https://developers.google.com/style/filenames)
Make file and directory names lowercase, with the occasional exception for consistency, to make file searches easier and search results more useful. For example, because most Unix-style operating systems are case sensitive, they can't find a file named Impersonate-Service-Accounts.html if you search for impersonate-service-accounts.html. Linux and macOS interpret these as two distinct files.

Use hyphens, not underscores, to separate words—for example, query-data.html. Search engines interpret hyphens in file and directory names as spaces between words. Underscores are generally not recognized, meaning that their presence can negatively affect SEO.

Use only standard ASCII alphanumeric characters in file and directory names.

Don't use generic page names such as document1.html.

Exceptions for consistency
If you're adding to a directory where everything else already uses underscores, and it's not feasible to change everything to hyphens, it's okay to use underscores to stay consistent.

For example, if the directory already has lesson_1.jd, lesson_2.jd, and lesson_3.jd, it's okay to add your new file as lesson_4.jd instead of lesson-4.jd. However, in all other situations, use hyphens.

Recommended: avoiding-cliches.jd

Sometimes OK: avoiding_cliches.jd

Not recommended: avoidingcliches.jd

Not recommended: avoidingCliches.jd

Not recommended: avoiding-clichés.jd

Other exceptions
It's okay to have some inconsistency in filenames if it can't otherwise be avoided. For example, sometimes tools that generate reference documentation produce filenames based on different style requirements or based on the design and naming conventions of the product or API itself. In those cases, it's okay to make exceptions for those files.
