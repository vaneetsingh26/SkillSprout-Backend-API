exports.accountDeletedEmail = (email, name) => {
    return `<!DOCTYPE html>
    <html>
    
    <head>
        <meta charset="UTF-8">
        <title>Password Update Confirmation</title>
        <style>
            body {
                background-color: #ffffff;
                font-family: Arial, sans-serif;
                font-size: 16px;
                line-height: 1.4;
                color: #333333;
                margin: 0;
                padding: 0;
            }
    
            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                text-align: center;
            }
    
            .logo {
                max-width: 200px;
                margin-bottom: 20px;
            }
    
            .message {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 20px;
            }
    
            .body {
                font-size: 16px;
                margin-bottom: 20px;
            }
    
            .support {
                font-size: 14px;
                color: #999999;
                margin-top: 20px;
            }
    
            .highlight {
                font-weight: bold;
            }
        </style>
    
    </head>
    
    <body>
        <div class="container">
            <a href=""><img class="logo"
                    src="https://i.ibb.co/nsyJHKYR/Skillsprout-logo.png" alt="Skillsprout logo" border="0"></a>
            <div class="message">Password Update Confirmation</div>
            <div class="body">
                <p>Hey ${name},</p><br /><br />
                <p>This email is to confirm that your SkillSprout account associated with <span class="highlight">${email}</span> has been permanently deleted.</p><br>
                <p>As per your request, all your personal data, progress, and uploaded content have been securely wiped from our servers.</p><br>
                <p>We are sorry to see you go! If you ever decide to return, you will be more than welcome to start fresh with us.</p>
            </div>
            <div class="support">If you have any questions or need further assistance, please feel free to reach out to us
                at
                <a href="mailto:vaneetsingh2004@gmail.com">vaneetsingh@gmail.com</a>. We are here to help!
            </div>
        </div>
    </body>
    
    </html>`;
}