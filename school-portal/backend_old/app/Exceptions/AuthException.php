<?php

declare(strict_types=1);

namespace App\Exceptions;

use Symfony\Component\HttpKernel\Exception\HttpException;

class AuthException extends HttpException
{
    public function __construct(string $message = 'Unauthorized.', ?\Throwable $previous = null)
    {
        parent::__construct(403, $message, $previous);
    }
}
