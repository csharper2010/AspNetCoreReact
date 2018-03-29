using System;
using System.Linq;
using System.Linq.Expressions;

namespace Getränkehandel.Business.Repository
{
    public static class ExpressionExtensions
    {
        public static Expression<Func<T, bool>> Not<T>(this Expression<Func<T, bool>> predicate)
        {
            return Expression.Lambda<Func<T, bool>>(Expression.Not(predicate.Body), predicate.Parameters);
        }

        public static Expression<Func<T, bool>> And<T>(this Expression<Func<T, bool>> left, Expression<Func<T, bool>> right)
        {
            return Expression.Lambda<Func<T, bool>>(Expression.AndAlso(left.Body, right.WithParametersOf(left).Body), left.Parameters);
        }

        public static Expression<Func<T, bool>> Or<T>(this Expression<Func<T, bool>> left, Expression<Func<T, bool>> right)
        {
            return Expression.Lambda<Func<T, bool>>(Expression.OrElse(left.Body, right.WithParametersOf(left).Body), left.Parameters);
        }

        private static Expression<Func<TResult>> WithParametersOf<T, TResult>(this Expression<Func<T, TResult>> left, Expression<Func<T, TResult>> right)

        {

            return new ReplaceParameterVisitor<Func<TResult>>(left.Parameters[0], right.Parameters[0]).Visit(left);

        }
        
        private class ReplaceParameterVisitor<TResult> : ExpressionVisitor
        {
            private readonly ParameterExpression parameter;
            private readonly Expression replacement;
            public ReplaceParameterVisitor(ParameterExpression parameter, Expression replacement)
            {
                this.parameter = parameter;
                this.replacement = replacement;
            }
            public Expression<TResult> Visit<T>(Expression<T> node)
            {
                var parameters = node.Parameters.Where(p => p != parameter);
                return Expression.Lambda<TResult>(Visit(node.Body), parameters);
            }
            protected override Expression VisitParameter(ParameterExpression node)
            {
                return node == parameter ? replacement : base.VisitParameter(node);
            }
        }
    }
}